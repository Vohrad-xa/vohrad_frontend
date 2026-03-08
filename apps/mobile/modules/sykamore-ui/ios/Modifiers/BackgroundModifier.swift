import ExpoModulesCore
import SwiftUI

internal enum BackgroundStyleType: String, Enumerable {
  case color
  case gradient
}

internal struct BackgroundModifier: ViewModifier, Record {
  @Field var styleType: BackgroundStyleType = .color
  @Field var color: Color?
  @Field var gradient: GradientConfig?
  @Field var shape: ShapeType?
  @Field var cornerRadius: CGFloat = 0
  @Field var roundedCornerStyle: RoundedCornerStyle?
  @Field var cornerSize: CornerSize?

  @ViewBuilder
  func body(content: Content) -> some View {
    switch styleType {
    case .color:
      if let color {
        if let shapeType = shape {
          switch shapeType {
          case .capsule:
            content.background(color, in: makeCapsule(style: roundedCornerStyle))
          case .circle:
            content.background(color, in: Circle())
          case .ellipse:
            content.background(color, in: Ellipse())
          case .rectangle:
            content.background(color, in: Rectangle())
          case .roundedRectangle:
            content.background(color, in: makeRoundedRectangle(cornerRadius: cornerRadius, cornerSize: cornerSize, style: roundedCornerStyle))
          }
        } else {
          content.background(color)
        }
      } else {
        content
      }
    case .gradient:
      if let style = gradient?.resolve() {
        content.background(style)
      } else {
        content
      }
    }
  }
}
