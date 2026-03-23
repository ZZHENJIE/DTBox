class UserInfo {
  private static instance: UserInfo;
  private value: object = {};
  private none: boolean = true;

  private constructor() {}

  public static getInstance(): UserInfo {
    if (!UserInfo.instance) {
      UserInfo.instance = new UserInfo();
    }
    return UserInfo.instance;
  }

  public IsNone(): boolean {
    return this.none;
  }

  public Get(): object {
    return this.value;
  }

  public Set(value: object): void {
    this.value = value;
    this.none = false;
  }
}

export default UserInfo.getInstance();
