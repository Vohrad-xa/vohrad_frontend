import SwiftUI
import ExpoModulesCore

enum TextCase: String, Enumerable {
  case uppercase, lowercase

  func toSwiftUI() -> SwiftUI.Text.Case {
    switch self {
    case .uppercase: .uppercase
    case .lowercase: .lowercase
    }
  }
}

// MARK: - Text Modifiers

struct ItalicTextModifier: ViewModifier {
  var enabled: Bool

  @ViewBuilder
  func body(content: Content) -> some View {
    if enabled {
      if #available(iOS 16.0, *) {
        content.italic()
      } else {
        content
      }
    } else {
      content
    }
  }
}

struct UnderlineTextModifier: ViewModifier {
  var enabled: Bool

  @ViewBuilder
  func body(content: Content) -> some View {
    if enabled {
      if #available(iOS 16.0, *) {
        content.underline()
      } else {
        content
      }
    } else {
      content
    }
  }
}

struct StrikethroughTextModifier: ViewModifier {
  var enabled: Bool

  @ViewBuilder
  func body(content: Content) -> some View {
    if enabled {
      if #available(iOS 16.0, *) {
        content.strikethrough()
      } else {
        content
      }
    } else {
      content
    }
  }
}

struct MonospacedTextModifier: ViewModifier {
  var enabled: Bool

  @ViewBuilder
  func body(content: Content) -> some View {
    if enabled {
      if #available(iOS 16.0, *) {
        content.monospaced()
      } else {
        content.font(.system(.body, design: .monospaced))
      }
    } else {
      content
    }
  }
}

struct KerningTextModifier: ViewModifier {
  var value: Double?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let kerning = value {
      if #available(iOS 16.0, *) {
        content.kerning(CGFloat(kerning))
      } else {
        content
      }
    } else {
      content
    }
  }
}

struct TrackingTextModifier: ViewModifier {
  var value: Double?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let tracking = value {
      if #available(iOS 16.0, *) {
        content.tracking(CGFloat(tracking))
      } else {
        content
      }
    } else {
      content
    }
  }
}

struct BaselineOffsetTextModifier: ViewModifier {
  var value: Double?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let offset = value {
      if #available(iOS 16.0, *) {
        content.baselineOffset(CGFloat(offset))
      } else {
        content
      }
    } else {
      content
    }
  }
}

// MARK: - TextView

internal final class TextViewProps: UIBaseViewProps {
  @Field var text: String = ""
  @Field var lineLimit: Int?
  @Field var textCase: TextCase?
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
    Text(props.text)
      .lineLimit(props.lineLimit)
      .if(props.textCase != nil) { text in
        text.textCase(props.textCase?.toSwiftUI())
      }
      .modifier(ItalicTextModifier(enabled: props.italic))
      .modifier(UnderlineTextModifier(enabled: props.underline))
      .modifier(StrikethroughTextModifier(enabled: props.strikethrough))
      .modifier(MonospacedTextModifier(enabled: props.monospaced))
      .if(props.monospacedDigit) { text in
        text.monospacedDigit()
      }
      .modifier(KerningTextModifier(value: props.kerning))
      .modifier(TrackingTextModifier(value: props.tracking))
      .modifier(BaselineOffsetTextModifier(value: props.baselineOffset))
  }
}
