import ExpoModulesCore

public final class SykamoreUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SykamoreUi")

    // MARK: - Views
    View(HostView.self)
    View(ListView.self)
    View(Button.self)
    View(SectionView.self)
    View(SectionHeader.self)
    View(SectionFooter.self)
    View(SectionContent.self)
    View(LabelView.self)
    View(LabelIcon.self)
    View(ContextMenu.self)
    View(ContextMenuPreview.self)
    View(ContextMenuActivationElement.self)
    View(ContextMenuContent.self)
    View(TextView.self)
    View(ImageView.self)
    View(SwitchView.self)
    View(SpacerView.self)
    View(DividerView.self)
    View(PickerView.self)
    View(PickerContentView.self)
    View(PickerLabelView.self)
    View(TextFieldView.self)
  }
}
