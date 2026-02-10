import type { Decorator, Preview } from "@storybook/react"

import "../app/globals.css"

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme

  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }

  return Story()
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
      },
    },
  },
  parameters: {
    layout: "padded",
  },
  decorators: [withTheme],
}

export default preview
