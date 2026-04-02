class JWTToken {
  private static instance: JWTToken;
  private value: string = "";

  private constructor() {}

  public static getInstance(): JWTToken {
    if (!JWTToken.instance) {
      JWTToken.instance = new JWTToken();
    }
    return JWTToken.instance;
  }

  public Get(): string {
    return this.value;
  }

  public Set(value: string): void {
    this.value = value;
  }
}

export default JWTToken.getInstance();
