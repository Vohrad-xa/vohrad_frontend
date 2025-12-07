import ExpoModulesCore
import SwiftUI

/** Button role for swipe actions */
internal enum SwipeActionRole: String, Enumerable {
  case `default`
  case destructive
  case cancel

  func toNativeRole() -> SwiftUI.ButtonRole? {
    switch self {
    case .default:
      return nil
    case .destructive:
      return SwiftUI.ButtonRole.destructive
    case .cancel:
      return SwiftUI.ButtonRole.cancel
    }
  }
}

/** Single swipe action configuration */
internal struct SwipeActionConfig: Record {
  @Field var id: String = ""
  @Field var label: String = ""
  @Field var systemImage: String?
  @Field var role: SwipeActionRole = .default
  @Field var tint: Color?
}

/** Swipe actions modifier for list rows */
internal struct SwipeActionsModifier: ViewModifier, Record {
  @Field var edge: String = "trailing"
  @Field var allowsFullSwipe: Bool = true
  @Field var actions: [SwipeActionConfig] = []
  var eventDispatcher: EventDispatcher?

  init() {}

  init(from params: Dict, appContext: AppContext, eventDispatcher: EventDispatcher) throws {
    try self = .init(from: params, appContext: appContext)
    self.eventDispatcher = eventDispatcher
  }

  func body(content: Content) -> some View {
    if #available(iOS 15.0, *) {
      let horizontalEdge: HorizontalEdge = edge == "leading" ? .leading : .trailing
      content.swipeActions(edge: horizontalEdge, allowsFullSwipe: allowsFullSwipe) {
        ForEach(actions, id: \.id) { action in
          SwiftUI.Button(role: action.role.toNativeRole()) {
            eventDispatcher?(["swipeActions": ["actionId": action.id, "label": action.label]])
          } label: {
            if let systemImage = action.systemImage, !systemImage.isEmpty {
              Label(action.label, systemImage: systemImage)
            } else {
              Text(action.label)
            }
          }
          .tint(action.tint)
        }
      }
    } else {
      content
    }
  }
}
