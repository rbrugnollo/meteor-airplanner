import { uniqBy } from 'lodash';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Airplane, AirplanesCollection } from '../collection';

export const insert = createMethod({
  name: 'airplanes.insert',
  schema: z.custom<Omit<Airplane, BaseCollectionTypes>>(),
  async run(airplane) {
    let pilots = airplane.pilots ?? [];
    if (airplane.captain) {
      pilots = [...pilots, airplane.captain];
    }
    if (airplane.firstOfficer) {
      pilots = [...pilots, airplane.firstOfficer];
    }
    pilots = uniqBy(pilots, 'value');

    return AirplanesCollection.insertAsync({
      ...airplane,
      pilots,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
