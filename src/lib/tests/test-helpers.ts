import { vi } from 'vitest';

type MockFn = ReturnType<typeof vi.fn>;

type ModelMock<T extends string> = Record<T, MockFn>;

export type PrismaMock = {
  application: ModelMock<'findMany' | 'create' | 'findUnique' | 'update'>;
  group: ModelMock<'findMany' | 'create' | 'findUnique'>;
  groupMember: ModelMock<'findUnique' | 'findFirst' | 'create' | 'update'>;
  friend: ModelMock<'findMany' | 'findFirst' | 'create' | 'deleteMany'>;
  user: ModelMock<'findUnique'>;
  job: ModelMock<'findUnique'>;
};

const createSection = <T extends string>(keys: T[]): ModelMock<T> =>
  keys.reduce((acc, key) => {
    acc[key] = vi.fn();
    return acc;
  }, {} as ModelMock<T>);

export const createPrismaMock = (partial?: Partial<PrismaMock>): PrismaMock => {
  const base: PrismaMock = {
    application: createSection(['findMany', 'create', 'findUnique', 'update']),
    group: createSection(['findMany', 'create', 'findUnique']),
    groupMember: createSection(['findUnique', 'findFirst', 'create', 'update']),
    friend: createSection(['findMany', 'findFirst', 'create', 'deleteMany']),
    user: createSection(['findUnique']),
    job: createSection(['findUnique']),
  };

  return {
    ...base,
    ...partial,
    application: { ...base.application, ...(partial?.application ?? {}) },
    group: { ...base.group, ...(partial?.group ?? {}) },
    groupMember: { ...base.groupMember, ...(partial?.groupMember ?? {}) },
    friend: { ...base.friend, ...(partial?.friend ?? {}) },
    user: { ...base.user, ...(partial?.user ?? {}) },
    job: { ...base.job, ...(partial?.job ?? {}) },
  };
};

export const mockRequireAuth = <T>(user: T) => vi.fn().mockResolvedValue(user);

export const mockRandomUUIDSequence = (values: string[]) => {
  let index = 0;
  return vi
    .spyOn(crypto, 'randomUUID')
    .mockImplementation(() => values[Math.min(index++, values.length - 1)]);
};
