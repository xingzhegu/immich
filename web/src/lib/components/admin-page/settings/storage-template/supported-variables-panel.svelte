<div class="mt-4 text-sm">
  <h4>其他变量</h4>
</div>

<div class="p-4 mt-2 text-xs bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-immich-dark-fg">
  <div class="flex gap-[50px]">
    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">文件名</p>
      <ul>
        <li>{`{{filename}}`} - IMG_123</li>
        <li>{`{{ext}}`} - jpg</li>
      </ul>
    </div>

    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary">文件类型</p>
      <ul>
        <li>{`{{filetype}}`} - 视频或图片</li>
        <li>{`{{filetypefull}}`} - 视频或图片</li>
      </ul>
    </div>
    <div>
      <p class="font-medium text-immich-primary dark:text-immich-dark-primary uppercase">其他</p>
      <ul>
        <li>{`{{assetId}}`} - 资源ID</li>
        <li>{`{{album}}`} - 相册名称</li>
      </ul>
    </div>
  </div>
</div>
