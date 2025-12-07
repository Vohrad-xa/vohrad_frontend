import ExpoModulesCore
import SwiftUI

/** Type-erased wrapper for ViewModifier */
internal struct AnyViewModifier: ViewModifier {
  private let _body: (Content) -> AnyView

  init<T: ViewModifier>(_ modifier: T) {
    _body = { content in
      AnyView(content.modifier(modifier))
    }
  }

  func body(content: Content) -> some View {
    _body(content)
  }
}

/** Registry for SwiftUI view modifiers */
internal class ViewModifierRegistry {
  static let shared = ViewModifierRegistry()

  internal typealias ModifierFactory = ([String: Any], AppContext, EventDispatcher) throws -> any ViewModifier
  private(set) internal var modifierFactories: [String: ModifierFactory] = [:]

  private init() {
    registerBuiltInModifiers()
  }

  func register(_ type: String, factory: @escaping ModifierFactory) {
    modifierFactories[type] = factory
  }

  func applyModifier(
    _ type: String,
    to view: AnyView,
    appContext: AppContext,
    globalEventDispatcher: EventDispatcher,
    params: [String: Any]
  ) -> AnyView {
    guard let viewModifier = try? modifierFactories[type]?(params, appContext, globalEventDispatcher) else {
      return view
    }
    return AnyView(view.modifier(AnyViewModifier(viewModifier)))
  }

  private func registerBuiltInModifiers() {
    register("swipeActions") { params, appContext, eventDispatcher in
      return try SwipeActionsModifier(from: params, appContext: appContext, eventDispatcher: eventDispatcher)
    }
  }
}
