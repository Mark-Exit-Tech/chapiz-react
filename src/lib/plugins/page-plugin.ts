import React from 'react';

export interface PagePlugin {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  enabled: boolean;
  order: number;
}

export interface PagePluginConfig {
  plugins: PagePlugin[];
  layout?: 'vertical' | 'horizontal';
}

export class PluginRegistry {
  private plugins: Map<string, PagePlugin> = new Map();

  register(plugin: PagePlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): PagePlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): PagePlugin[] {
    return Array.from(this.plugins.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.order - b.order);
  }

  enable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) plugin.enabled = true;
  }

  disable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) plugin.enabled = false;
  }
}

export interface PluginRendererProps {
  plugins: PagePlugin[];
  props?: Record<string, any>;
}

export function PluginRenderer({ plugins, props = {} }: PluginRendererProps) {
  return React.createElement(
    React.Fragment,
    null,
    plugins.map((plugin) => {
      return React.createElement(plugin.component, {
        key: plugin.id,
        ...props
      });
    })
  );
}