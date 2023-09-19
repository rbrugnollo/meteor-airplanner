export interface BaseCollection {
  readonly _id: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
}

export type BaseCollectionTypes = '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy';
export type IdBaseCollectionTypes = 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy';
