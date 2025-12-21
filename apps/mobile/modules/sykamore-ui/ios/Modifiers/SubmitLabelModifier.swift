import ExpoModulesCore
import SwiftUI

internal struct SubmitLabelModifier: ViewModifier, Record {
  @Field var submitLabel: SubmitLabel?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let submitLabel {
      content.submitLabel(submitLabel.toSwiftUI())
    } else {
      content
    }
  }
}