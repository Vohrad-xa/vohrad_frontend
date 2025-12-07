import SwiftUI
import ExpoModulesCore

enum TextCase: String, Enumerable {
  case uppercase = "uppercase"
  case lowercase = "lowercase"

  func toSwiftUI() -> SwiftUI.Text.Case {
    switch self {
    case .uppercase: return .uppercase
    case .lowercase: return .lowercase
    }
  }
}

internal final class TextViewProps: UIBaseViewProps {
  @Field var text: String = ""
  @Field var weight: FontWeight?
  @Field var design: FontDesign?
  @Field var size: Double?
  @Field var lineLimit: Int?
  @Field var color: Color?
  @Field var textCase: TextCase?
  @Field var bold: Bool = false
  @Field var italic: Bool = false
  @Field var underline: Bool = false
  @Field var strikethrough: Bool = false
  @Field var monospaced: Bool = false
  @Field var monospacedDigit: Bool = false
  @Field var kerning: Double?
  @Field var tracking: Double?
  @Field var baselineOffset: Double?
}

internal struct TextView: ExpoSwiftUI.View {
  @ObservedObject var props: TextViewProps


  var body: some View {
    let hasDeprecatedFontProps = props.weight != nil || props.design != nil || props.size != nil

    Text(props.text)
      .if(hasDeprecatedFontProps) { text in
        // TODO: remove this block of code once we remove the deprecated font props
        text.font(.system(
          size: CGFloat(props.size ?? 17),
          weight: props.weight?.toSwiftUI() ?? .regular,
          design: props.design?.toSwiftUI() ?? .default
        ))
      }
      .lineLimit(props.lineLimit)
      .foregroundColor(props.color)
      .if(props.textCase != nil) { text in
        text.textCase(props.textCase?.toSwiftUI())
      }
      .if(props.bold) { text in
        text.bold()
      }
      .if(props.italic) { text in
        text.italic()
      }
      .if(props.underline) { text in
        text.underline()
      }
      .if(props.strikethrough) { text in
        text.strikethrough()
      }
      .if(props.monospaced) { text in
        text.monospaced()
      }
      .if(props.monospacedDigit) { text in
        text.monospacedDigit()
      }
      .if(props.kerning != nil) { text in
        text.kerning(CGFloat(props.kerning ?? 0))
      }
      .if(props.tracking != nil) { text in
        text.tracking(CGFloat(props.tracking ?? 0))
      }
      .if(props.baselineOffset != nil) { text in
        text.baselineOffset(CGFloat(props.baselineOffset ?? 0))
      }
  }
}
