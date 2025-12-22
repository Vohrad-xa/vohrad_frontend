import SwiftUI
import ExpoModulesCore

internal final class PickerProps: UIBaseViewProps {
  @Field var label: String?
  @Field var systemImage: String?
  @Field var selection: Either<String, Double>?
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
      if let icon = extractLabelIcon(labelContent), let label = props.label {
        Picker(selection: $selection) {
          content
        } label: {
          Label {
            Text(label)
          } icon: {
            icon
          }
        }
      } else {
        // Custom React label node (text-only or fully custom)
        Picker(selection: $selection) {
          content
        } label: {
          labelContent
        }
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

  var body: some View {
    makePicker()
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

  private func extractLabelIcon(_ labelView: PickerLabelView) -> PickerLabelIcon? {
    labelView.props.children?
      .compactMap { $0.childView as? PickerLabelIcon }
      .first
  }
}
