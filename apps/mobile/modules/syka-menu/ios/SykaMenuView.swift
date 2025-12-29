import ExpoModulesCore
import React
import UIKit

protocol MenuPresentingView where Self: UIView {
  var title: String? { get set }
  var actions: [NSDictionary]? { get set }
  var shouldOpenOnLongPress: Bool { get set }
  var themeVariant: String? { get set }
  var hitSlop: UIEdgeInsets { get set }
  var onPressAction: ((String) -> Void)? { get set }
  var onMenuOpen: (() -> Void)? { get set }
  var onMenuClose: (() -> Void)? { get set }
}

public final class SykaMenuView: ExpoView {
  private let menuView: (UIView & MenuPresentingView)

  var actions: [NSDictionary] = [] {
    didSet {
      menuView.actions = actions
    }
  }

  var actionsHash: String? {
    didSet {
      guard actionsHash != oldValue else {
        return
      }
      menuView.actions = actions
    }
  }

  var title: String? {
    didSet {
      menuView.title = title
    }
  }

  var shouldOpenOnLongPress: Bool = false {
    didSet {
      menuView.shouldOpenOnLongPress = shouldOpenOnLongPress
    }
  }

  var themeVariant: String? {
    didSet {
      menuView.themeVariant = themeVariant
    }
  }

  var hitSlop: UIEdgeInsets = .zero {
    didSet {
      menuView.hitSlop = hitSlop
    }
  }

  var testID: String? {
    didSet {
      menuView.accessibilityIdentifier = testID
    }
  }

  var accessibilityLabelText: String? {
    didSet {
      menuView.accessibilityLabel = accessibilityLabelText
    }
  }

  var accessibilityHintText: String? {
    didSet {
      menuView.accessibilityHint = accessibilityHintText
    }
  }

  public required init(appContext: AppContext? = nil) {
    menuView = SykaMenuViewImplementation()

    super.init(appContext: appContext)

    setContentHuggingPriority(.required, for: .horizontal)
    setContentHuggingPriority(.required, for: .vertical)
    setContentCompressionResistancePriority(.required, for: .horizontal)
    setContentCompressionResistancePriority(.required, for: .vertical)

    menuView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(menuView)
    NSLayoutConstraint.activate([
      menuView.topAnchor.constraint(equalTo: topAnchor),
      menuView.leadingAnchor.constraint(equalTo: leadingAnchor),
      menuView.trailingAnchor.constraint(equalTo: trailingAnchor),
      menuView.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    bindEvents()
  }

  public override var intrinsicContentSize: CGSize {
    menuView.intrinsicContentSize
  }

  public override func sizeThatFits(_ size: CGSize) -> CGSize {
    menuView.sizeThatFits(size)
  }

  private func bindEvents() {
    menuView.onPressAction = { [weak self] event in
      self?.dispatchEvent("onPressAction", payload: ["event": event])
    }
    menuView.onMenuOpen = { [weak self] in
      self?.dispatchEvent("onOpenMenu", payload: [:])
    }
    menuView.onMenuClose = { [weak self] in
      self?.dispatchEvent("onCloseMenu", payload: [:])
    }
  }

#if RCT_NEW_ARCH_ENABLED
  public override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    menuView.insertSubview(childComponentView, at: index)
    invalidateIntrinsicContentSize()
  }

  public override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
    invalidateIntrinsicContentSize()
  }
#else
  public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    menuView.insertSubview(subview, at: atIndex)
    invalidateIntrinsicContentSize()
  }

  public override func removeReactSubview(_ subview: UIView!) {
    subview.removeFromSuperview()
    invalidateIntrinsicContentSize()
  }
#endif
}
