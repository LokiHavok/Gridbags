// Import necessary Foundry hooks and classes
import { preloadTemplates } from "./templates.js"; // You'll define this later

// Module namespace
const MODULE_ID = "gridbags";

// Hook into init for setup
Hooks.once("init", () => {
  // Register custom item sheet for containers
  Items.registerSheet(MODULE_ID, ContainerItemSheet, {
    types: ["item"], // Apply to base item, filter in sheet
    makeDefault: false,
    label: "Gridbags Container Sheet"
  });

  // Preload Handlebars templates
  preloadTemplates();

  // Register settings if needed (e.g., default grid sizes)
  game.settings.register(MODULE_ID, "defaultGridRows", {
    name: "Default Grid Rows",
    hint: "Default rows for new containers",
    scope: "world",
    config: true,
    type: Number,
    default: 5
  });
});

// Custom Item Sheet for Containers (extends ItemSheet, adds grid like Griddy)
class ContainerItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["sheet", "item", "gridbags-container"],
      template: `modules/${MODULE_ID}/templates/container-sheet.html`,
      width: 600,
      height: 500,
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "grid" }]
    });
  }

  getData() {
    const data = super.getData();
    // Add grid config from flags (like Griddy)
    data.grid = this.item.getFlag(MODULE_ID, "grid") || { rows: 5, cols: 5, slots: [] };
    data.contents = this.item.getFlag(MODULE_ID, "contents") || []; // Nested items, like Item Collection
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Add drag/drop listeners for grid (copy from Griddy)
    html.find(".grid-slot").on("dragstart", this._onDragStart.bind(this));
    html.find(".grid-slot").on("drop", this._onDrop.bind(this));
    // Resizing, splitting, etc. (implement like Griddy)
    html.find(".item-config").click(this._openConfigDialog.bind(this));
  }

  _openConfigDialog(event) {
    // Dialog for grid size, type, etc. (similar to Griddy's config)
    new Dialog({
      title: "Configure Container",
      content: `<form>
        <label>Grid Rows: <input type="number" name="rows" value="${this.item.getFlag(MODULE_ID, "grid.rows") || 5}"></label>
        <label>Grid Cols: <input type="number" name="cols" value="${this.item.getFlag(MODULE_ID, "grid.cols") || 5}"></label>
        <label>Type: <select name="type"><option>Backpack</option><option>Keyring</option><option>Lockbox</option></select></label>
      </form>`,
      buttons: {
        save: {
          label: "Save",
          callback: async (html) => {
            const formData = new FormData(html[0].querySelector("form"));
            await this.item.setFlag(MODULE_ID, "grid", {
              rows: formData.get("rows"),
              cols: formData.get("cols")
            });
            await this.item.setFlag(MODULE_ID, "type", formData.get("type"));
            this.render(true);
          }
        }
      }
    }).render(true);
  }

  // Drag/drop handlers (adapt from Griddy for grid, Item Collection for nesting)
  _onDrop(event) {
    // Parse dropped data (item ID), check if it fits grid, handle nesting if dropped on sub-container
    // Update flags.contents array for nested items
  }
}
