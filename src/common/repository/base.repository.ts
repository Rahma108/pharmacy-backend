export abstract class BaseRepository<
  T,
  ID,
  CreateData,
  UpdateData,
> {
  constructor(
    protected readonly model: {
      findMany(args?: {
      skip?: number;
      take?: number;
      where?: unknown;
      orderBy?: unknown;
      include?: unknown;
    }): Promise<T[]>;

      count(args?: {
        where?: unknown;
      }): Promise<number>;

      findUnique(args: {
        where: { id: ID };
      }): Promise<T | null>;

      create(args: {
        data: CreateData;
      }): Promise<T>;

      update(args: {
        where: { id: ID };
        data: UpdateData;
      }): Promise<T>;

      delete(args: {
        where: { id: ID };
      }): Promise<T>;
    },
  ) {}

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  async findById(id: ID): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  async create(data: CreateData): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: ID, data: UpdateData): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async hardDelete(id: ID): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async paginate({
  page = 1,
  limit = 10,
  where,
  orderBy,
  include,
}: {
  page?: number;
  limit?: number;
  where?: unknown;
  orderBy?: unknown;
  include?: unknown;
}) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.model.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    }),

    this.model.count({
      where,
    }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
}