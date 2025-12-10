import SwiftUI
import ExpoModulesCore

internal final class GlassContainerViewProps: UIBaseViewProps {
  @Field var spacing: Double?
}

internal struct GlassContainerView: ExpoSwiftUI.View {
  @ObservedObject var props: GlassContainerViewProps

  var body: some View {
    if #available(iOS 26.0, macOS 26.0, tvOS 26.0, *) {
      #if compiler(>=6.2) // Xcode 26
      GlassContainer(spacing: CGFloat(props.spacing ?? 0.0)) {
        Children()
      }
      #else
      Children()
      #endif
    } else {
      Children()
    }
  }
}
