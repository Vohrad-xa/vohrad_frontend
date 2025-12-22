import SwiftUI
import ExpoModulesCore

final class StepperProps: UIBaseViewProps {
  @Field var label: String
  @Field var defaultValue: Int?
  @Field var min: Int = 0
  @Field var max: Int = 100
  @Field var step: Int = 1
  @Field var stepperModifiers: ModifierArray?
  var onValueChanged = EventDispatcher()
}

struct StepperView: ExpoSwiftUI.View {
  @ObservedObject var props: StepperProps
  @State var value: Int

  init(props: StepperProps) {
    self.props = props
    let initialValue = props.defaultValue ?? 0
    let clampedValue = max(props.min, min(props.max, initialValue))
    self._value = State(initialValue: clampedValue)
  }

  var body: some View {
#if !os(tvOS)
    HStack {
      Text(props.label)
      Spacer()
      Stepper("", value: $value, in: props.min...props.max, step: props.step)
        .labelsHidden()
        .applyModifiers(props.stepperModifiers, appContext: props.appContext, globalEventDispatcher: props.globalEventDispatcher)
    }
    .onChange(of: value, perform: { newValue in
      props.onValueChanged(([
        "value": Int(newValue)
      ]))
    })
    .onAppear {
      // Ensure the value is set correctly when the view appears
      if let defaultValue = props.defaultValue {
        let clampedValue = max(props.min, min(props.max, defaultValue))
        value = clampedValue
      }
    }
#else
    EmptyView()
#endif
  }
}