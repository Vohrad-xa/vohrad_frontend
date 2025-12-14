package expo.modules.sykamoreui

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable
import expo.modules.kotlin.views.ComposeProps

enum class ActivationMethod(val value: String) : Enumerable {
  SINGLE_PRESS("singlePress"),
  LONG_PRESS("longPress")
}

data class ContextMenuProps(
  val activationMethod: MutableState<ActivationMethod> = mutableStateOf(ActivationMethod.SINGLE_PRESS)
) : ComposeProps

class ContextMenuActivationElementProps : ComposeProps

class ContextMenuContentProps : ComposeProps

class ContextMenuPreviewProps : ComposeProps
