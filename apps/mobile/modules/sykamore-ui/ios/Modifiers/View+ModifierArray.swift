import ExpoModulesCore
import SwiftUI

internal extension View {
  /**
   * Conditionally applies a transformation to a view.
   */
  @ViewBuilder
  func applyIf<T: View>(_ condition: Bool, transform: (Self) -> T) -> some View {
    if condition {
      transform(self)
    } else {
      self
    }
  }

  /**
   * Applies an array of modifiers to a view using the ViewModifierRegistry.
   */
  @ViewBuilder
  func applyModifiers(_ modifiers: ModifierArray?, appContext: AppContext?, globalEventDispatcher: EventDispatcher) -> some View {
    if let modifiers, let appContext {
      modifiers.reduce(AnyView(self)) { currentView, modifierConfig in
        guard let type = modifierConfig["$type"] as? String else {
          return currentView
        }

        return ViewModifierRegistry.shared.applyModifier(
          type,
          to: currentView,
          appContext: appContext,
          globalEventDispatcher: globalEventDispatcher,
          params: modifierConfig
        )
      }
    } else {
      self
    }
  }
}
