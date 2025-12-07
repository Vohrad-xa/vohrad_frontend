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
  }
}
