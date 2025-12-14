package expo.modules.sykamoreui

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SykamoreUiModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SykamoreUi")

    // Context Menu Views
    View(ContextMenu::class)
    View(ContextMenuActivationElement::class)
    View(ContextMenuContent::class)
    View(ContextMenuPreview::class)
  }
}
