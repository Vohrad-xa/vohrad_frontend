import SwiftUI
import ExpoModulesCore

internal enum ToggleStyleType: String, Enumerable {
  case automatic
  case `switch`
  case button
  case checkbox
}

internal struct ToggleStyleModifier: ViewModifier, Record {
  @Field var style: ToggleStyleType = .automatic

  @ViewBuilder
  func body(content: Content) -> some View {
    switch style {
    case .switch:
      content.toggleStyle(.switch)
    case .button:
      content.toggleStyle(.button)
    case .checkbox:
      if #available(iOS 15.0, *) {
        content.toggleStyle(.checkbox)
      } else {
        content.toggleStyle(.automatic)
      }
    case .automatic:
      content.toggleStyle(.automatic)
    }
  }
}