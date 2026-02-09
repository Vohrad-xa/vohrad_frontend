import ExpoModulesCore

public final class SykamoreUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SykamoreUi")

    // MARK: - Core

    View(HostView.self)
    View(NamespaceView.self)
    // MARK: - Layout

    ExpoUIView(HStackView.self)
    ExpoUIView(VStackView.self)
    ExpoUIView(ZStackView.self)
    ExpoUIView(SpacerView.self)
    ExpoUIView(DividerView.self)
    ExpoUIView(GroupView.self)
    ExpoUIView(DisclosureGroupView.self)

    // MARK: - Lists & Sections

    ExpoUIView(ListView.self)
    ExpoUIView(FormView.self)
    ExpoUIView(SectionView.self)
    View(SectionHeader.self)
    View(SectionFooter.self)
    View(SectionContent.self)

    // MARK: - Typography & Media

    ExpoUIView(TextView.self)
    ExpoUIView(ImageView.self)
    ExpoUIView(LabelView.self)
    View(LabelIcon.self)

    // MARK: - Controls

    ExpoUIView(SykamoreUi.Button.self)
    ExpoUIView(ToggleView.self)
    ExpoUIView(StepperView.self)
    ExpoUIView(SliderView.self)
    View(SliderLabelView.self)
    ExpoUIView(DatePickerView.self)
    ExpoUIView(PickerView.self)
    View(PickerContentView.self)
    View(PickerLabelView.self)
    View(PickerLabelIcon.self)

    // MARK: - Text Input

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


    // MARK: - Content Containers

    ExpoUIView(LabeledContentView.self)
    View(LabeledContentLabel.self)
    View(LabeledContentContent.self)

    // MARK: - Context Menus & Popovers

    ExpoUIView(ContextMenu.self)
    View(ContextMenuActivationElement.self)
    View(ContextMenuPreview.self)
    View(ContextMenuContent.self)
    ExpoUIView(PopoverView.self)
    View(PopoverViewContent.self)
    View(PopoverViewPopContent.self)

    // MARK: - Effects & Shapes

    ExpoUIView(GlassEffectContainerView.self)
    ExpoUIView(RoundedRectangleView.self)
    ExpoUIView(CircleView.self)
    ExpoUIView(ConcentricRectangleView.self)

    // MARK: - Lifecycle

    OnDestroy {
      Task { @MainActor in
        NamespaceRegistry.shared.removeAll()
      }
    }
  }
}
