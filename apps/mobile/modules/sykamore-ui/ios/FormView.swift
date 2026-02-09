import SwiftUI
import ExpoModulesCore

internal final class FormViewProps: UIBaseViewProps {
  @Field var scrollDisabled: Bool = false
}

internal struct FormView: ExpoSwiftUI.View {
  @ObservedObject var props: FormViewProps

  var body: some View {
    let form = Form {
      Children()
    }

    if #available(iOS 16.0, tvOS 16.0, *) {
      form.scrollDisabled(props.scrollDisabled)
    } else {
      form
    }
  }
}