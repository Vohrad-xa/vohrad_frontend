package expo.modules.sykamoremenu

internal data class MenuAnchor(
  val x: Int,
  val y: Int,
  val width: Int,
  val height: Int
)

internal data class MenuLevel(
  val title: String?,
  val actions: List<SykaMenuActionRecord>
)
