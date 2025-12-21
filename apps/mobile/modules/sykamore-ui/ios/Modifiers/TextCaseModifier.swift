import SwiftUI
import ExpoModulesCore

internal enum TextCaseTypes: String, Enumerable {
  case lowercase
  case uppercase
}

internal struct TextCaseModifier: ViewModifier, Record {
  @Field var value: TextCaseTypes = .lowercase

  func body(content: Content) -> some View {
    switch value {
    case .lowercase:
      content.textCase(.lowercase)
    case .uppercase:
      content.textCase(.uppercase)
    }
  }
}
