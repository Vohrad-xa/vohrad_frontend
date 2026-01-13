package expo.modules.sykamoremenu

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.PopupProperties
import kotlin.math.min

@Composable
internal fun SykaDropdownMenu(
  anchor: MenuAnchor,
  actions: List<SykaMenuActionRecord>,
  submenuTitleColor: Color,
  menuTitle: String?,
  onActionSelected: (SykaMenuActionRecord) -> Unit,
  onDismiss: () -> Unit
) {
  var menuStack by remember { mutableStateOf(listOf(MenuLevel(null, actions))) }
   var menuSize by remember { mutableStateOf(IntSize.Zero) }
  val menuSizes = remember { mutableStateMapOf<String, IntSize>() }
  val currentLevel = menuStack.last()
  val rootKey = remember(actions) { menuKeyForActions(actions) }
  val levelKey = remember(currentLevel.actions) { menuKeyForActions(currentLevel.actions) }
  val rootSize = menuSizes[rootKey]
  val sizeForOffset = rootSize ?: menuSizes[levelKey] ?: menuSize
  val density = LocalDensity.current
  val configuration = LocalConfiguration.current
  val edgeMargin = UiEdgeMargin
  val edgeMarginPx = with(density) { edgeMargin.toPx() }
  val screenWidthDp = configuration.screenWidthDp.dp
  val screenWidthPx = with(density) { screenWidthDp.toPx() }
  val menuMaxWidthDp = maxOf(screenWidthDp * UiMaxWidthFraction, UiMinWidth)
  val menuMaxWidthPx = with(density) { menuMaxWidthDp.toPx() }
  val anchorWidth = with(density) { anchor.width.toDp() }
  val anchorHeight = with(density) { anchor.height.toDp() }
  val menuWidthPx = if (sizeForOffset.width > 0) {
    min(sizeForOffset.width.toFloat(), menuMaxWidthPx)
  } else {
    0f
  }
  val menuWidthDp = if (menuWidthPx > 0f) {
    with(density) { menuWidthPx.toDp() }
  } else {
    null
  }
  val menuOffsetX = if (menuWidthPx > 0f) {
    val baseOffsetPx = 0f
    val desiredLeftPx = anchor.x.toFloat() + baseOffsetPx
    val maxLeftPx = (screenWidthPx - menuWidthPx - edgeMarginPx)
      .coerceAtLeast(edgeMarginPx)
    val clampedLeftPx = desiredLeftPx.coerceIn(edgeMarginPx, maxLeftPx)
    val correctedOffsetPx = baseOffsetPx + (clampedLeftPx - desiredLeftPx)
    with(density) { correctedOffsetPx.toDp() }
  } else {
    0.dp
  }

  Box(modifier = Modifier.fillMaxSize()) {
    Box(
      modifier = Modifier
        .offset { IntOffset(anchor.x, anchor.y) }
        .size(anchorWidth, anchorHeight)
    ) {
      DropdownMenu(
        expanded = true,
        onDismissRequest = onDismiss,
        shape = MaterialTheme.shapes.small,
        containerColor = MenuDefaults.containerColor,
        offset = DpOffset(menuOffsetX, 0.dp),
        modifier = (menuWidthDp?.let { Modifier.width(it) } ?: Modifier)
          .widthIn(max = menuMaxWidthDp)
          .onSizeChanged { size ->
            menuSize = size
            menuSizes[levelKey] = size
          },
        properties = PopupProperties(focusable = true)
      ) {
        if (menuStack.size == 1) {
          menuTitle?.takeIf { it.isNotBlank() }?.let { title ->
            SectionTitle(text = title)
          }
        }

        if (menuStack.size > 1) {
          DropdownMenuItem(
            text = { Text("Back") },
            leadingIcon = {
              Icon(
                imageVector = Icons.Filled.ChevronLeft,
                contentDescription = "Back"
              )
            },
            onClick = { menuStack = menuStack.dropLast(1) }
          )
          HorizontalDivider()
          currentLevel.title?.takeIf { it.isNotBlank() }?.let { title ->
            SectionTitle(text = title)
          }
        }

        MenuActions(
          actions = currentLevel.actions,
          submenuTitleColor = submenuTitleColor,
          onActionSelected = onActionSelected,
          onSubmenuSelected = { action ->
            menuStack = menuStack + MenuLevel(action.title, action.subactions.toList())
          }
        )
      }
    }
  }
}

@Composable
private fun MenuActions(
  actions: List<SykaMenuActionRecord>,
  submenuTitleColor: Color,
  onActionSelected: (SykaMenuActionRecord) -> Unit,
  onSubmenuSelected: (SykaMenuActionRecord) -> Unit
) {
  var hasVisibleItems = false
  actions.forEach { action ->
    if (action.attributes?.hidden == true) {
      return@forEach
    }

    val hasSubactions = action.subactions.isNotEmpty()
    val displayInline = hasSubactions && action.menuOptions?.displayInline == true
    if (displayInline) {
      if (hasVisibleItems) {
        HorizontalDivider()
      }
      SectionTitle(text = action.title)
      MenuActions(
        actions = action.subactions.toList(),
        submenuTitleColor = submenuTitleColor,
        onActionSelected = onActionSelected,
        onSubmenuSelected = onSubmenuSelected
      )
    } else {
      MenuActionItem(
        action = action,
        submenuTitleColor = submenuTitleColor,
        onActionSelected = onActionSelected,
        onSubmenuSelected = onSubmenuSelected
      )
    }

    hasVisibleItems = true
  }
}

@Composable
private fun MenuActionItem(
  action: SykaMenuActionRecord,
  submenuTitleColor: Color,
  onActionSelected: (SykaMenuActionRecord) -> Unit,
  onSubmenuSelected: (SykaMenuActionRecord) -> Unit
) {
  val hasSubactions = action.subactions.isNotEmpty()
  val isDisabled = action.attributes?.disabled == true
  val isSubmenuTrigger = hasSubactions
  val destructiveColor = MaterialTheme.colorScheme.error
  val resolvedTitleColor = resolveTitleColor(
    action = action,
    isSubmenuTrigger = isSubmenuTrigger,
    submenuTitleColor = submenuTitleColor,
    destructiveColor = destructiveColor
  )
  val resolvedIconColor = resolveIconColor(
    action = action,
    isSubmenuTrigger = isSubmenuTrigger,
    destructiveColor = destructiveColor
  )
  val subtitleColor = resolvedTitleColor?.copy(alpha = UiSubtitleAlpha)
    ?: MaterialTheme.colorScheme.onSurfaceVariant
  val trailingIcon: (@Composable () -> Unit)? = when {
    isSubmenuTrigger -> {
      {
        Icon(
          imageVector = Icons.Filled.ChevronRight,
          contentDescription = "Open submenu"
        )
      }
    }
    action.state == "on" -> {
      {
        Icon(
          imageVector = Icons.Filled.Check,
          contentDescription = "Selected"
        )
      }
    }
    else -> null
  }

  DropdownMenuItem(
    text = {
      MenuItemText(
        title = action.title,
        subtitle = action.subtitle,
        subtitleColor = subtitleColor
      )
    },
    enabled = !isDisabled,
    colors = MenuDefaults.itemColors(
      textColor = resolvedTitleColor ?: Color.Unspecified,
      leadingIconColor = resolvedIconColor ?: Color.Unspecified,
      trailingIconColor = resolvedTitleColor ?: Color.Unspecified
    ),
    leadingIcon = action.image?.let { iconName ->
      {
        MenuIcon(
          iconName = iconName,
          contentDescription = action.title
        )
      }
    },
    trailingIcon = trailingIcon,
    onClick = {
      if (isSubmenuTrigger) {
        onSubmenuSelected(action)
      } else {
        onActionSelected(action)
      }
    }
  )
}

@Composable
private fun MenuItemText(
  title: String,
  subtitle: String?,
  subtitleColor: Color
) {
  Column(verticalArrangement = Arrangement.spacedBy(UiSubtitleSpacing)) {
    Text(
      text = title,
      style = MaterialTheme.typography.bodyLarge
    )
    if (!subtitle.isNullOrBlank()) {
      Text(
        text = subtitle,
        style = MaterialTheme.typography.bodySmall,
        color = subtitleColor
      )
    }
  }
}

@Composable
private fun SectionTitle(text: String) {
  Text(
    text = text,
    style = MaterialTheme.typography.labelSmall,
    color = MaterialTheme.colorScheme.onSurfaceVariant,
    textAlign = TextAlign.Start,
    modifier = Modifier
      .fillMaxWidth()
      .padding(UiSectionTitlePadding)
  )
}

@Composable
private fun MenuIcon(
  iconName: String,
  contentDescription: String?
) {
  val imageVector = remember(iconName) { getImageVector(iconName) }
  if (imageVector != null) {
    Icon(
      imageVector = imageVector,
      contentDescription = contentDescription
    )
  }
}

private fun resolveTitleColor(
  action: SykaMenuActionRecord,
  isSubmenuTrigger: Boolean,
  submenuTitleColor: Color,
  destructiveColor: Color
): Color? {
  val isDisabled = action.attributes?.disabled == true
  val isDestructive = action.attributes?.destructive == true ||
    (isSubmenuTrigger && action.menuOptions?.destructive == true)
  val titleColor = action.titleColor?.let { Color(it) }

  return when {
    isDisabled -> null
    isDestructive -> destructiveColor
    titleColor != null -> titleColor
    isSubmenuTrigger -> submenuTitleColor
    else -> null
  }
}
