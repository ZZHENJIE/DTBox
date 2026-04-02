export interface ResponseValue<T> {
  code: number;
  message: string;
  data: T | null;
}

export class Response<T> {
  private response: ResponseValue<T>;

  constructor(response: ResponseValue<T>) {
    this.response = response;
  }

  ok(): this | undefined {
    return this.response.code === 0 ? this : undefined;
  }

  get data(): T | null {
    return this.response.data;
  }

  get error(): string | null {
    return this.response.code !== 0 ? this.response.message : null;
  }

  onError(handler: (message: string) => void): this {
    if (this.response.code !== 0) {
      const message = `Code:${this.response.code},Message:${this.response.message}`;
      handler(message);
    }
    return this;
  }
}
