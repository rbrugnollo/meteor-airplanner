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
        return apiCache.result as Promise<T>;
      }
    }

    // If not cached, fetch the data and store it in the cache
    const fetchPromise = fetch(url, init).then((response) => {
      if (!response.ok) {
        throw new Error(`Fetch failed for URL: ${url}`);
      }
      return response.json() as Promise<T>;
    });

    await ApiCacheLogsCollection.insertAsync({ key, result: fetchPromise, createdAt: new Date() });

    return fetchPromise;
  };
}

const cachedFetch = createFetchMemoizer();

export default cachedFetch;
