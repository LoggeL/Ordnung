const pb = new PocketBase('https://ordnung.logge.top')

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

// Custom cell renderer
class BtnCellRenderer {
  constructor(props) {
    const el = document.createElement('button')

    el.classList.add('cell-btn', 'border')
    el.disabled = props.value === ''
    el.innerText = props.value === '' ? 'No link' : 'Open'
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

// Blacklist columns
const blacklist = ['collectionId', 'collectionName', 'created', 'id', 'expand']
let collections = {}

pb.admins
  .authWithPassword('logge@duck.com', '404noswagfound')
  .then(() => {
    // Get all collections
    pb.collections.getFullList().then((data) => {
      console.log(data)

      data.forEach((collection) => {
        if (collection.type !== 'base') return

        collections[collection.name] = collection

        const row = document.createElement('a')
        row.classList.add('row', 'round')
        row.innerHTML = `
          <i>inbox</i>
          <span>${collection.name}</span>
        `
        row.addEventListener('click', () => {
          loadCollection(collection.name)
        })

        document.getElementById('collections').appendChild(row)
      })
    })

    console.log('Logged in')
  })
  .catch((err) => {
    console.log(err)
  })

function loadCollection(collectionName) {
  document.getElementById('grid').innerHTML = ''

  document.getElementById('name').innerText =
    collectionName.slice(0, 1).toUpperCase() + collectionName.slice(1)

  // Close sidebar
  document.getElementById('collections').classList.remove('active')

  pb.collection(collectionName)
    .getFullList()
    .then((data) => {
      console.log(data)

      // Create column definitions

      const columnDefs = Object.values(collections[collectionName].schema).map(
        (val) => {
          if (val.name.toLowerCase() == 'ort') {
            console.log('Ort')
            return {
              name: val.name,
              header: val.name,
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
                      console.log(data)

                      modal.querySelector('h5').innerText =
                        data.name || 'No name'

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

          console.log(val.type)
          switch (val.type) {
            case 'text':
              return {
                name: val.name,
                sortable: true,
                type: val.type,
                header: val.name,
              }
            case 'url':
              return {
                name: val.name,
                header: val.name,

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
              }
          }
        }
      )

      // Remove blacklisted columns
      const columnDefsFiltered = columnDefs.filter(
        (e) => !blacklist.includes(e.field)
      )

      // setup the grid after the page has finished loading
      const gridDiv = document.getElementById('grid')

      const instance = new Grid({
        scrollX: true,
        scrollY: true,
        el: document.getElementById('grid'),
        columns: columnDefsFiltered,
        data,
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
