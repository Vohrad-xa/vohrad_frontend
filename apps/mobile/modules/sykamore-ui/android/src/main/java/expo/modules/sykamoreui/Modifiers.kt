package expo.modules.sykamoreui

import android.graphics.Color
import androidx.compose.ui.Modifier
import expo.modules.kotlin.sharedobjects.SharedRef
import androidx.compose.ui.graphics.Color as ComposeColor

class ExpoModifier(ref: Modifier?) : SharedRef<Modifier?>(ref)

fun Modifier.fromExpoModifiers(
  modifiers: List<ExpoModifier>
): Modifier {
  return modifiers.fold(this) { acc, modifier ->
    val ref = modifier.ref
    ref?.let { acc.then(it) } ?: acc
  }
}

data class DialogStyleColors(
  val dialogBackgroundColor: ComposeColor? = null,
  val tintColor: ComposeColor? = null
)

data class DialogBackgroundColorModifier(val color: ComposeColor) : Modifier.Element
data class TintColorModifier(val color: ComposeColor) : Modifier.Element

fun Modifier.dialogBackgroundColor(color: Color): Modifier {
  return this.then(DialogBackgroundColorModifier(color.compose))
}

fun Modifier.tintColor(color: Color): Modifier {
  return this.then(TintColorModifier(color.compose))
}

fun Modifier.extractDialogStyleColors(): DialogStyleColors {
  return foldIn(DialogStyleColors()) { acc, element ->
    when (element) {
      is DialogBackgroundColorModifier -> acc.copy(dialogBackgroundColor = element.color)
      is TintColorModifier -> acc.copy(tintColor = element.color)
      else -> acc
    }
  }
}
