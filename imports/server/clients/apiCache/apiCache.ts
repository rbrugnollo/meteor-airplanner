import { fetch } from 'meteor/fetch';
import { ApiCacheLogsCollection } from '/imports/api/apiCacheLogs/collection';
import dayjs from 'dayjs';

type FetchFunction = <T>(url: RequestInfo | URL, init?: RequestInit | undefined) => Promise<T>;

function createFetchMemoizer(): FetchFunction {
  return async <T>(url: RequestInfo | URL, init?: RequestInit | undefined) => {
    const key = JSON.stringify({ url, init });
    const apiCache = await ApiCacheLogsCollection.findOneAsync({ key });

    // if cached, return the cached result
    if (apiCache) {
      if (dayjs(apiCache.createdAt).diff(dayjs(), 'month') > 6) {
        ApiCacheLogsCollection.removeAsync({ _id: apiCache._id });
      } else {
        return apiCache.result as T;
      }
    }

    const result = await fetch(url, init);
    const json = await result.json();

    await ApiCacheLogsCollection.insertAsync({ key, result: json, createdAt: new Date() });

    return json;
  };
}

const cachedFetch = createFetchMemoizer();

export default cachedFetch;
