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
        if #available(iOS 16.0, *) {
          text.bold()
        } else {
          text.fontWeight(.bold)
        }
      }
      .if(props.italic) { text in
        if #available(iOS 16.0, *) {
          text.italic()
        } else {
          text
        }
      }
      .if(props.underline) { text in
        if #available(iOS 16.0, *) {
          text.underline()
        } else {
          text
        }
      }
      .if(props.strikethrough) { text in
        if #available(iOS 16.0, *) {
          text.strikethrough()
        } else {
          text
        }
      }
      .if(props.monospaced) { text in
        if #available(iOS 16.0, *) {
          text.monospaced()
        } else {
          text.font(.system(.body, design: .monospaced))
        }
      }
      .if(props.monospacedDigit) { text in
        text.monospacedDigit()
      }
      .if(props.kerning != nil) { text in
        if #available(iOS 16.0, *) {
          text.kerning(CGFloat(props.kerning ?? 0))
        } else {
          text
        }
      }
      .if(props.tracking != nil) { text in
        if #available(iOS 16.0, *) {
          text.tracking(CGFloat(props.tracking ?? 0))
        } else {
          text
        }
      }
      .if(props.baselineOffset != nil) { text in
        if #available(iOS 16.0, *) {
          text.baselineOffset(CGFloat(props.baselineOffset ?? 0))
        } else {
          text
        }
      }
  }
}
