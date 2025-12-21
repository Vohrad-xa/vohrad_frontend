import ExpoModulesCore

public final class SykamoreUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SykamoreUi")

    // MARK: - Views
    View(HostView.self)
    ExpoUIView(PopoverView.self)
    View(NamespaceView.self)
    View(PopoverViewContent.self)
    View(PopoverViewPopContent.self)
    ExpoUIView(ListView.self)
    ExpoUIView(SykamoreUi.Button.self)
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
    ExpoUIView(GlassEffectContainerView.self)
    ExpoUIView(DatePickerView.self)
    ExpoUIView(TextView.self)
    ExpoUIView(ImageView.self)
    ExpoUIView(SwitchView.self)
    View(SwitchIcon.self)
    ExpoUIView(SpacerView.self)
    ExpoUIView(DividerView.self)
    ExpoUIView(PickerView.self)
    View(PickerContentView.self)
    View(PickerLabelView.self)
    View(PickerLabelIcon.self)
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
    View(SecureFieldView.self) {
      AsyncFunction("setText") { (view: SecureFieldView, text: String) in
        view.setText(text)
      }
      AsyncFunction("blur") { (view: SecureFieldView) in
        view.blur()
      }
      AsyncFunction("focus") { (view: SecureFieldView) in
        view.focus()
      }
    }
    ExpoUIView(HStackView.self)
    ExpoUIView(VStackView.self)
    ExpoUIView(ProgressView.self)
    ExpoUIView(FormView.self)
    ExpoUIView(CircleView.self)
    ExpoUIView(ToggleView.self)
    ExpoUIView(StepperView.self)
    ExpoUIView(ConcentricRectangleView.self)
  }
}
