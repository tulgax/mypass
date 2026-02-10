import type { StorybookConfig } from "@storybook/nextjs"

const config: StorybookConfig = {
  stories: [
    "../components/**/*.mdx",
    "../components/**/*.stories.@(ts|tsx)",
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@chromatic-com/storybook"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
}

export default config
