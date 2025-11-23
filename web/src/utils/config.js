const defaultConfig = {
  user: {
    token: "",
    user_id: 1,
  },
  config: {
    theme: "light",
    language: "en",
  },
};

export function resetConfig() {
  localStorage.removeItem("config");
}

export function getConfig() {
  const config = localStorage.getItem("config");
  return config ? JSON.parse(config) : defaultConfig;
}

export function setConfig(config) {
  localStorage.setItem("config", JSON.stringify(config));
}
