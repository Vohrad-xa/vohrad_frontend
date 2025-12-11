import SwiftUI
import ExpoModulesCore

internal final class ImageViewProps: UIBaseViewProps {
  @Field var systemName: String = ""
  @Field var size: Double?
  @Field var color: Color?
  @Field var variableValue: Double?
  @Field var symbolRenderingMode: String?
  @Field var paletteColors: [Color]?
  @Field var useTapGesture: Bool?
  var onTap = EventDispatcher()
}

internal struct ImageView: ExpoSwiftUI.View {
  @ObservedObject var props: ImageViewProps

  var body: some View {
    var image: Image

    if #available(iOS 16.0, tvOS 16.0, *) {
      image = Image(systemName: props.systemName, variableValue: props.variableValue)
    } else {
      image = Image(systemName: props.systemName)
    }

    if let mode = props.symbolRenderingMode {
      switch mode {
      case "monochrome":
        image = image.symbolRenderingMode(.monochrome)
      case "palette":
        image = image.symbolRenderingMode(.palette)
      case "hierarchical":
        image = image.symbolRenderingMode(.hierarchical)
      case "multicolor":
        image = image.symbolRenderingMode(.multicolor)
      default:
        break
      }
    }

    let styledImage: Image
    if let palette = props.paletteColors, !palette.isEmpty {
      switch palette.count {
      case 1:
        styledImage = image.foregroundStyle(palette[0])
      case 2:
        styledImage = image.foregroundStyle(palette[0], palette[1])
      default:
        styledImage = image.foregroundStyle(palette[0], palette[1], palette[2])
      }
    } else {
      styledImage = image.foregroundColor(props.color)
    }

    return styledImage
      .font(.system(size: CGFloat(props.size ?? 24)))
      .applyOnTapGesture(useTapGesture: props.useTapGesture, eventDispatcher: props.onTap)
  }
}
