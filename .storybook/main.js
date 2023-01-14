module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  babel: async (options) => {
    return {
      ...options,
      plugins: [
        ['@babel/plugin-transform-typescript', { isTSX: true }],
        ...options.plugins,
      ],
    };
  },
}