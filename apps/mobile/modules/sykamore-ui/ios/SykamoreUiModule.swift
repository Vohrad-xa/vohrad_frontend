import ExpoModulesCore

public final class SykamoreUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SykamoreUi")

    // MARK: - Views
    View(HostView.self)
    ExpoUIView(ListView.self)
    ExpoUIView(Button.self)
    ExpoUIView(SectionView.self)
    View(SectionHeader.self)
    View(SectionFooter.self)
    View(SectionContent.self)
    ExpoUIView(LabelView.self)
    View(LabelIcon.self)
    ExpoUIView(ContextMenu.self)
    View(ContextMenuPreview.self)
    View(ContextMenuActivationElement.self)
    View(ContextMenuContent.self)
    ExpoUIView(TextView.self)
    ExpoUIView(ImageView.self)
    ExpoUIView(SwitchView.self)
    ExpoUIView(SpacerView.self)
    ExpoUIView(DividerView.self)
    ExpoUIView(PickerView.self)
    View(PickerContentView.self)
    View(PickerLabelView.self)
    View(TextFieldView.self) {
      AsyncFunction("setText") { (view: TextFieldView, text: String) in
        view.setText(text)
      }
      AsyncFunction("blur") { (view: TextFieldView) in
        view.blur()
      }
      AsyncFunction("focus") { (view: TextFieldView) in
        view.focus()
      }
      AsyncFunction("setSelection") { (view: TextFieldView, start: Int, end: Int) in
        view.setSelection(start: start, end: end)
      }
    }
    ExpoUIView(HStackView.self)
    ExpoUIView(VStackView.self)
    ExpoUIView(ProgressView.self)
  }
}
