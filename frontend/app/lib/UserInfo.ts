class UserInfo {
  private static instance: UserInfo;
  private value: object = {};

  private constructor() {}

  public static getInstance(): UserInfo {
    if (!UserInfo.instance) {
      UserInfo.instance = new UserInfo();
    }
    return UserInfo.instance;
  }

  public Get(): object {
    return this.value;
  }

  public Set(value: object): void {
    this.value = value;
  }
}

export default UserInfo.getInstance();
