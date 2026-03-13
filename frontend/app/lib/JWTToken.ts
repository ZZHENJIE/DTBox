class JWTToken {
  private static instance: JWTToken;
  private token: string = "";

  private constructor() {}

  public static getInstance(): JWTToken {
    if (!JWTToken.instance) {
      JWTToken.instance = new JWTToken();
    }
    return JWTToken.instance;
  }

  public Get(): string {
    return this.token;
  }

  public Set(value: string): void {
    this.token = value;
  }
}

export default JWTToken.getInstance();
