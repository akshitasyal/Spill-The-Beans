$src = 'C:\Users\Akshat\.gemini\antigravity-ide\brain\88fae46f-fcaf-4446-8ae7-43253dc692fe'
$dst = 'c:\Users\Akshat\Impulse Coffee\src\assets'

$map = @{
    'hero_bg_1781200486766.png' = 'hero_bg.png'
    'product_hazelnut_instant_1781200640219.png' = 'product_hazelnut.png'
    'product_caramel_instant_1781200650782.png' = 'product_caramel.png'
    'product_vanilla_instant_1781200713015.png' = 'product_vanilla.png'
    'product_dark_choco_instant_1781200724052.png' = 'product_dark_choco.png'
    'product_coorg_arabica_1781200662796.png' = 'product_coorg.png'
    'product_monsoon_malabar_1781200736333.png' = 'product_monsoon_malabar.png'
    'product_araku_arabica_1781200746689.png' = 'product_araku.png'
    'product_nilgiri_blend_1781200767593.png' = 'product_nilgiri.png'
    'product_bundle_1781200780342.png' = 'product_bundle.png'
    'product_explorer_bundle_1781200884646.png' = 'product_explorer_bundle.png'
    'product_gift_box_1781200673941.png' = 'product_gift_box.png'
    'product_coffee_lover_set_1781200897325.png' = 'product_coffee_lover.png'
    'product_limited_monsoon_1781200793200.png' = 'product_limited_monsoon.png'
    'product_harvest_gold_1781200873658.png' = 'product_harvest_gold.png'
    'about_hero_1781200804843.png' = 'about_hero.png'
}

foreach ($key in $map.Keys) {
    $source = Join-Path $src $key
    $target = Join-Path $dst $map[$key]
    Copy-Item $source $target
    Write-Host "Copied $key -> $($map[$key])"
}
Write-Host "All done!"
