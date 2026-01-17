import SwiftUI
import ExpoModulesCore

internal final class ImageViewProps: UIBaseViewProps {
  @Field var systemName: String = ""
  @Field var variableValue: Double?
  @Field var useTapGesture: Bool?
  var onTap = EventDispatcher()
}

internal struct ImageView: ExpoSwiftUI.View {
  @ObservedObject var props: ImageViewProps

  var body: some View {
    let image: Image

    if #available(iOS 16.0, tvOS 16.0, *) {
      image = Image(systemName: props.systemName, variableValue: props.variableValue)
    } else {
      image = Image(systemName: props.systemName)
    }

    return
      image
      .applyOnTapGesture(useTapGesture: props.useTapGesture, eventDispatcher: props.onTap)
  }
}
