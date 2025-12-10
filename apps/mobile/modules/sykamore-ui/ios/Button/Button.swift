import SwiftUI
import ExpoModulesCore

struct Button: ExpoSwiftUI.View {
  @ObservedObject var props: ButtonProps

  var body: some View {
    let button = SwiftUI.Button(
      role: props.buttonRole?.toNativeRole(),
      action: {
        props.onButtonPressed()
      },
      label: {
        if let text = props.text {
          if let systemImage = props.systemImage {
            Label(text, systemImage: systemImage)
          } else {
            Text(text)
          }
        } else if let systemImage = props.systemImage {
          Image(systemName: systemImage)
        } else {
          Children()
        }
      })
      .disabled(props.disabled)
      .tint(props.color)
      .controlSize(props.controlSize?.toNativeControlSize() ?? .regular)
      // TODO: Maybe there is a way to do a switch statement similarly to the `if` extension?
      .if(props.variant == .bordered, {
        $0.buttonStyle(.bordered)
      })
      .if(props.variant == .plain, {
        $0.buttonStyle(.plain)
      })
      .if(props.variant == .borderedProminent, {
        $0.buttonStyle(.borderedProminent)
      })
      .if(props.variant == .borderless, {
        $0.buttonStyle(.borderless)
      })

    if #available(iOS 26.0, *) {
      #if compiler(>=6.2) // Xcode 26
      switch props.variant {
      case .glass:
        button.buttonStyle(.glass)
      case .glassProminent:
        button.buttonStyle(.glassProminent)
      default:
        button
      }
      #else
      button
      #endif
    } else {
      button
    }
  }
}
