const pb = new PocketBase('https://ordnungdb.logge.top')

// Tui Grid
const Grid = tui.Grid
Grid.applyTheme('striped', {
  selection: {
    background: '#4daaf9',
    border: '#004082',
  },
  scrollbar: {
    background: '#f5f5f5',
    thumb: '#d9d9d9',
    active: '#c1c1c1',
  },
  row: {
    even: {
      background: '#f3ffe3',
    },
    hover: {
      background: '#ccc',
    },
  },
  cell: {
    normal: {
      background: '#fbfbfb',
      border: '#e0e0e0',
      showVerticalBorder: true,
    },
    header: {
      background: '#eee',
      border: '#ccc',
      showVerticalBorder: true,
    },
    rowHeader: {
      border: '#ccc',
      showVerticalBorder: true,
    },
    editable: {
      background: '#fbfbfb',
    },
    selectedHeader: {
      background: '#d8d8d8',
    },
    focused: {
      border: '#418ed4',
    },
    disabled: {
      text: '#b0b0b0',
    },
  },
})

// Tui Grid instance
let instance

// Custom cell renderer
class BtnCellRenderer {
  constructor(props) {
    const el = document.createElement('button')

    el.classList.add('cell-btn', 'border')
    el.disabled = !props.value
    el.innerText = props.value ? 'Open' : 'No link'
    el.onclick = props.columnInfo.renderer.clicked.bind(this, props.value)
    el.setAttribute('alt', props.value)

    const div = document.createElement('div')
    div.classList.add('tooltip')
    div.innerText = props.value

    el.appendChild(div)

    this.el = el
    this.render(props)
  }

  getElement() {
    return this.el
  }

  render(props) {}
}

// Custom Cell Editor for relation columns
class RelationCellEditor {
  constructor(props) {
    // Open relation-modal
    const modal = document.getElementById('relation-modal')
    modal.classList.add('active')

    // Get current collection name
    const collectionName = document
      .getElementById('name')
      .innerText.toLowerCase()

    // set relation-modal-collection-select
    const select = document.getElementById('relation-modal-collection-select')
    select.value = collectionName
  }

  getElement() {
    return this.el
  }

  getValue() {
    return this.el.value
  }

  mounted() {
    this.el.select()
  }
}

class TreeNode {
  constructor(name, key) {
    this.name = name
    this.children = []
    this.key = key
  }
}

function buildTree(objs) {
  const root = new TreeNode('root')

  for (const key of objs) {
    const parts = key.name.split('_')
    let currentNode = root

    for (const part of parts) {
      let childNode = currentNode.children.find((child) => child.name === part)

      if (!childNode) {
        childNode = new TreeNode(part, key.name)
        currentNode.children.push(childNode)
      }

      currentNode = childNode
    }
  }

  return root
}

function renderTree(tree, parent, level = 0) {
  for (const node of tree.children) {
    const row = document.createElement('div')
    row.classList.add('grid', 's12')
    row.style.padding = '0'
    row.setAttribute('data-level', level)

    const i = document.createElement('i')
    i.innerText = 'arrow_right'
    i.style.opacity = node.children.length > 0 ? '1' : '0'
    i.style.color = node.children.length > 0 ? 'black' : 'grey'
    i.style.cursor = node.children.length > 0 ? 'pointer' : 'default'
    i.style.height = '40px'
    i.classList.add('s1')
    if (node.children.length > 0) i.onclick = () => row.classList.toggle('open')
    row.appendChild(i)

    const button = document.createElement('button')
    button.innerText = capitalizeFirstLetter(node.name)
    button.classList.add('s11', 'border')
    button.style['text-align'] = 'left'
    if (node.key.split('_').length > level + 1)
      button.setAttribute('disabled', true)
    button.addEventListener('click', () => {
      loadCollection(node.key)
    })
    row.appendChild(button)

    // Add padding
    row.style.paddingLeft = `${level * 20}px`

    parent.appendChild(row)

    if (node.children.length > 0) {
      renderTree(node, row, level + 1)
    }
  }
}

// Blacklist columns
const blacklist = [] // ['collectionId', 'collectionName', 'created', 'expand']
let collections = {}

pb.admins
  .authWithPassword('logge@duck.com', '404noswagfound')
  .then(() => {
    // Get all collections
    pb.collections.getFullList().then((data) => {
      console.log(data)

      data = data
        .filter((e) => e.type === 'base')
        .sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })

      // Create sidebar
      const tree = buildTree(data)

      data.forEach((collection) => {
        collections[collection.name] = collection
      })

      // Init collection
      loadCollection('technik_pc_monitore')

      renderTree(tree, document.getElementById('collections-list'))

      // Populate relation-modal-collection-select
      const select = document.getElementById('relation-modal-collection-select')

      Object.keys(collections)
        .sort()
        .forEach((collection) => {
          const option = document.createElement('option')
          option.value = collection
          option.innerText = collection

          select.appendChild(option)
        })

      // Add event listener for relation-modal-search
      document
        .getElementById('relation-modal-search')
        .addEventListener('keyup', (e) => {
          const list = document.getElementById('relation-modal-item-list')
          const items = list.querySelectorAll('a')

          items.forEach((item) => {
            if (
              item.innerText
                .toLowerCase()
                .includes(e.target.value.toLowerCase())
            ) {
              item.style.display = 'flex'
            } else {
              item.style.display = 'none'
            }
          })
        })

      select.addEventListener('change', () => {
        // Populate relation-modal-item-list
        const list = document.getElementById('relation-modal-item-list')
        list.innerHTML = ''

        pb.collection(select.value)
          .getFullList()
          .then((data) => {
            console.log(data)

            data.forEach((item) => {
              const a = document.createElement('a')
              a.classList.add('row', 'wave', 'border', 'no-round')
              a.innerHTML = `
                <i></i>
                <div>${item.name}</div>
              `

              a.addEventListener('click', () => {
                // Collection from select
                alert(`${select.value}_${item.id}`)
                document
                  .getElementById('relation-modal')
                  .classList.remove('active')

                document.getElementById(
                  'relation-modal-collection-select'
                ).value = ''

                document.getElementById('relation-modal-item-list').innerHTML =
                  ''
              })

              list.appendChild(a)
            })
          })
      })
    })

    console.log('Logged in')
  })
  .catch((err) => {
    console.log(err)
  })

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function loadCollection(collectionName) {
  document.getElementById('grid').innerHTML = ''

  document.getElementById('name').innerText =
    collectionName.slice(0, 1).toUpperCase() + collectionName.slice(1)

  // Close sidebar
  document.getElementById('collections').classList.remove('active')

  pb.collection(collectionName)
    .getFullList()
    .then((data) => {
      // Create column definitions
      let colDefs = collections[collectionName].schema

      console.log(colDefs)

      // Add id
      colDefs.unshift({
        id: 'id',
        name: 'id',
        type: 'text',
      })

      const columnDefs = Object.values(colDefs).map((val) => {
        console.log(val)
        if (val.name.toLowerCase() == 'ort') {
          return {
            name: val.name,
            header: capitalizeFirstLetter(val.name),
            editor: {
              type: RelationCellEditor,
            },
            renderer: {
              type: BtnCellRenderer,
              clicked: async function (field) {
                const tags = field.split('_')

                // last tag is the id
                const id = tags.pop()

                // get the collection name from the remaining tags
                const collection = tags.join('_')

                const modal = document.getElementById('location-modal')

                pb.collection(collection)
                  .getOne(id)
                  .then((data) => {
                    modal.querySelector('h5').innerText = data.name || 'No name'

                    const table = modal.querySelector('table')
                    table.innerHTML = ''

                    for (const key in data) {
                      if (
                        key === 'name' ||
                        blacklist.includes(key) ||
                        typeof data[key] !== 'string'
                      )
                        continue
                      // Table
                      table.innerHTML += `
                          <tr>
                            <td>${key}</td>
                            <td>${data[key]}</td>
                          </tr>
                        `
                    }
                  })
                  .catch((err) => {
                    console.log(err)
                  })
                  .finally(() => {
                    ui('#location-modal')
                  })
              },
            },
          }
        }

        switch (val.type) {
          case 'text':
            return {
              name: val.name,
              sortable: true,
              type: val.type,
              header: capitalizeFirstLetter(val.name),
              editor: 'text',
            }
          case 'url':
            return {
              name: val.name,
              header: capitalizeFirstLetter(val.name),
              editor: 'text',

              renderer: {
                type: BtnCellRenderer,
                clicked: function (link) {
                  window.open(link, '_blank')
                },
              },
            }
          default:
            return {
              field: val.name,
              sortable: true,
              type: val.type,
              header: val.name,
              editor: 'text',
            }
        }
      })

      // Remove blacklisted columns
      const columnDefsFiltered = columnDefs.filter(
        (e) => !blacklist.includes(e.field)
      )

      // setup the grid after the page has finished loading
      instance = new Grid({
        scrollX: true,
        scrollY: true,
        el: document.getElementById('grid'),
        columns: columnDefsFiltered,
        data,
        usageStatistics: false,
        showDummyRows: true,
        contextMenu: ({ rowKey, columnName }) => [
          [
            {
              name: 'edit',
              label: 'Edit',
              action: () => {
                instance.startEditing(rowKey, columnName)
              },
            },
            {
              name: 'delete',
              label: 'Delete',
              action: () => {
                instance.removeRow(rowKey)
              },
            },
          ],
        ],
      })

      // Add event listener for afterChange
      instance.on('afterChange', (changes) => {
        const changedData = changes?.instance?.dataManager?.getAllModifiedData()
        if (!changedData) return

        console.log(changedData)

        // "createdRows"
        for (let i = 0; i < changedData['createdRows'].length; i++) {
          const create = changedData['createdRows'][i]

          // If the row already has an id, skip
          if (create['id']) continue

          // Check if all values are empty
          let empty = true

          for (const key in create) {
            if (key === 'rowKey') continue
            if (create[key]) {
              empty = false
              break
            }
          }

          if (empty) continue

          console.log(create)

          pb.collection(collectionName)
            .create(create)
            .then((data) => {
              // Assing id to the row
              instance.setValue(create['rowKey'], 'id', data.id)

              console.log(data)
              // id="toast-success"
              document.querySelector(
                '#toast-success span'
              ).innerText = `Created ${data.name}`
              ui('#toast-success')
            })
            .catch((err) => {
              console.log(err)
              // id="toast-error"
              document.querySelector('#toast-error span').innerText =
                err.message || `Error creating ${data.name}`
              ui('#toast-error')
            })
        }

        // "updatedRows"
        for (let i = 0; i < changedData['updatedRows'].length; i++) {
          const update = changedData['updatedRows'][i]

          pb.collection(update['collectionName'])
            .update(update['id'], update)
            .then((data) => {
              console.log(data)
              // id="toast-success"
              document.querySelector(
                '#toast-success span'
              ).innerText = `Updated ${data.name}`
              ui('#toast-success')
            })
            .catch((err) => {
              console.log(err)
              // id="toast-error"
              document.querySelector('#toast-error span').innerText =
                err.message || `Error updating ${data.name}`
              ui('#toast-error')
            })
        }

        instance.resetOriginData()
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
