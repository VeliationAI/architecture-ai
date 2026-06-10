export * from "./databricks.js";
export * from "./aws.js";
export * from "./platform-knowledge/index.js";
export * from "./icons/index.js";

import { DATABRICKS_COMPONENTS, DATABRICKS_TEMPLATES } from "./databricks.js";
import { AWS_COMPONENTS } from "./aws.js";
import { getComponentsForPlatform, getTemplatesForPlatform } from "./platform-knowledge/registry.js";

export function getCatalogForPlatform(platform: string) {
  const components = getComponentsForPlatform(platform);
  const templates = getTemplatesForPlatform(platform);

  if (components.length > 0) {
    return { components, templates };
  }

  return {
    components: [...DATABRICKS_COMPONENTS, ...AWS_COMPONENTS],
    templates: DATABRICKS_TEMPLATES,
  };
}
