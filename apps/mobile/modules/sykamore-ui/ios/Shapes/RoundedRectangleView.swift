import SwiftUI
import ExpoModulesCore

internal final class RoundedRectangleViewProps: UIBaseViewProps {
  @Field var cornerRadius: CGFloat = 0
  @Field var cornerStyle: RoundedCornerStyle?
}

internal struct RoundedRectangleView: ExpoSwiftUI.View {
  @ObservedObject var props: RoundedRectangleViewProps

  init(props: RoundedRectangleViewProps) {
    self.props = props
  }

  var body: some View {
    makeRoundedRectangle(
      cornerRadius: props.cornerRadius,
      cornerSize: nil,
      style: props.cornerStyle
    )
  }
}
