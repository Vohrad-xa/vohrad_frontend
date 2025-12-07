import ExpoModulesCore
import SwiftUI

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
