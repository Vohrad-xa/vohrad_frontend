import SwiftUI
import ExpoModulesCore

internal final class PickerProps: UIBaseViewProps {
  @Field var label: String?
  @Field var systemImage: String?
  @Field var selection: Either<String, Double>?

  // New: style / prompt / label behavior / disabled
  @Field var pickerStyle: String = "automatic"
  @Field var prompt: String?
  @Field var labelsHidden: Bool = false
  @Field var disabled: Bool = false

  var onSelectionChange = EventDispatcher()
}

internal struct PickerView: ExpoSwiftUI.View {
  @State private var selection: AnyHashable?
  @State private var prevSelection: AnyHashable?

  @ObservedObject var props: PickerProps

  init(props: PickerProps) {
    self.props = props
  }

  // Build the base SwiftUI Picker
  @ViewBuilder
  private func makePicker() -> some View {
    let content = props.children?
      .compactMap { $0.childView as? PickerContentView }
      .first

    let labelContent = props.children?
      .compactMap { $0.childView as? PickerLabelView }
      .first

    if let systemImage = props.systemImage, let label = props.label {
      // Native text + SF Symbol label
      Picker(label, systemImage: systemImage, selection: $selection) {
        content
      }
    } else if let labelContent {
      // Custom React label node (icon, text, whatever)
      Picker(selection: $selection) {
        content
      } label: {
        labelContent
      }
    } else if let label = props.label {
      // Text-only label
      Picker(label, selection: $selection) {
        content
      }
    } else {
      // No label at all
      Picker(selection: $selection) {
        content
      } label: {
        EmptyView()
      }
    }
  }

  // Apply style, prompt, labelsHidden, disabled
  private func applyPickerChrome<Content: View>(_ picker: Content) -> some View {
    var view: AnyView = AnyView(picker)

    // pickerStyle
    switch props.pickerStyle {
    case "segmented":
      view = AnyView(view.pickerStyle(.segmented))
    case "menu":
      if #available(iOS 14.0, tvOS 14.0, *) {
        view = AnyView(view.pickerStyle(.menu))
      } else {
        view = AnyView(view.pickerStyle(.automatic))
      }
    case "wheel":
      view = AnyView(view.pickerStyle(.wheel))
    case "inline":
      if #available(iOS 16.0, tvOS 16.0, *) {
        view = AnyView(view.pickerStyle(.inline))
      } else {
        view = AnyView(view.pickerStyle(.automatic))
      }
    default:
      view = AnyView(view.pickerStyle(.automatic))
    }

    // labelsHidden
    if props.labelsHidden {
      view = AnyView(view.labelsHidden())
    }

    // disabled
    if props.disabled {
      view = AnyView(view.disabled(true))
    }

    // prompt (mainly useful for .menu)
    if #available(iOS 15.0, tvOS 15.0, *), let prompt = props.prompt, !prompt.isEmpty {
      view = AnyView(view.prompt(Text(prompt)))
    }

    return view
  }

  var body: some View {
    let picker = applyPickerChrome(makePicker())

    picker
      .onChange(of: selection) { newValue in
        guard let newValue else { return }

        let currentSelection = getHashableFromEither(props.selection)
        if currentSelection == newValue {
          return
        }

        let payload: [String: Any]
        if let stringValue = newValue as? String {
          payload = ["selection": stringValue]
        } else if let doubleValue = newValue as? Double {
          payload = ["selection": doubleValue]
        } else {
          return
        }

        props.onSelectionChange(payload)
      }
      .onReceive(props.selection.publisher) { newValue in
        let hashableValue = getHashableFromEither(newValue)
        if prevSelection == hashableValue { return }
        selection = hashableValue
        prevSelection = hashableValue
      }
  }

  private func getHashableFromEither(_ either: Either<String, Double>?) -> AnyHashable? {
    guard let either else { return nil }
    if let stringValue: String = either.get() {
      return stringValue
    } else if let doubleValue: Double = either.get() {
      return doubleValue
    }
    return nil
  }
}
