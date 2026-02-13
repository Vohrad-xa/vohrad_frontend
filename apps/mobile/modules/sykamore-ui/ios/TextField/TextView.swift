import SwiftUI
import ExpoModulesCore

// MARK: - Text Modifier Structs (used by ViewModifierRegistry)

internal struct ItalicModifier: ViewModifier, Record {
  @Field var enabled: Bool = true

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

internal struct MonospacedModifier: ViewModifier, Record {
  @Field var enabled: Bool = true

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

internal struct MonospacedDigitModifier: ViewModifier, Record {
  @Field var enabled: Bool = true

  @ViewBuilder
  func body(content: Content) -> some View {
    if enabled {
      content.monospacedDigit()
    } else {
      content
    }
  }
}

internal struct TrackingModifier: ViewModifier, Record {
  @Field var value: CGFloat = 0

  func body(content: Content) -> some View {
    if #available(iOS 16.0, *) {
      content.tracking(value)
    } else {
      content
    }
  }
}

internal struct BaselineOffsetModifier: ViewModifier, Record {
  @Field var value: CGFloat = 0

  func body(content: Content) -> some View {
    if #available(iOS 16.0, *) {
      content.baselineOffset(value)
    } else {
      content
    }
  }
}

// MARK: - TextView

internal final class TextViewProps: UIBaseViewProps {
  @Field var text: String = ""
  @Field var lineLimit: Int?
  @Field var markdown: Bool = false
}

internal struct TextView: ExpoSwiftUI.View {
  @ObservedObject var props: TextViewProps

  var body: some View {
    if props.markdown {
      Text(LocalizedStringKey(props.text))
        .lineLimit(props.lineLimit)
    } else {
      Text(props.text)
        .lineLimit(props.lineLimit)
    }
  }
}
