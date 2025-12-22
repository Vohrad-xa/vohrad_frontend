import SwiftUI
import ExpoModulesCore

internal final class ToggleProps: UIBaseViewProps {
  @Field var isOn: Bool?
  @Field var label: String?
  @Field var systemImage: String?
  var onIsOnChange = EventDispatcher()
}

internal struct ToggleView: ExpoSwiftUI.View {
  @ObservedObject var props: ToggleProps
  @State var checked: Bool = false
  
  init(props: ToggleProps) {
    self.props = props
  }

  var body: some View {
    makeToggle()
      .onChange(of: checked) { newValue in
        if props.isOn == newValue {
          return
        }
        props.onIsOnChange([
          "isOn": newValue
        ])
      }
      .onChange(of: props.isOn) { newValue in
        guard let newValue else {
          checked = false
          return
        }
        checked = newValue
      }
      .onAppear {
        if let isOn = props.isOn {
          checked = isOn
        }
      }
  }

  @ViewBuilder
  private func makeToggle() -> some View {
    if let label = props.label {
      if props.children?.isEmpty == false {
        Toggle(isOn: $checked) {
          Label {
            Text(label)
          } icon: {
            Children()
          }
        }
      } else if let systemImage = props.systemImage {
        Toggle(label, systemImage: systemImage, isOn: $checked)
      } else {
        Toggle(label, isOn: $checked)
      }
    } else {
      Toggle(isOn: $checked) { Children() }
    }
  }
}